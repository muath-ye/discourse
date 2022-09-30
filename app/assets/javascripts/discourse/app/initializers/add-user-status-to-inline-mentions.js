import { withPluginApi } from "discourse/lib/plugin-api";
import getURL from "discourse-common/lib/get-url";
import { emojiUnescape } from "discourse/lib/text";
import { until } from "discourse/lib/formatter";

// fixme andrei: rename
function applyFlairOnMention(postElement, user, currentUser) {
  const href = getURL(`/u/${user.username.toLowerCase()}`);
  const mentions = postElement.querySelectorAll(`a.mention[href="${href}"]`);

  // fixme andrei: start and stop tracking in widget, not here
  user.trackStatus();

  mentions.forEach((mention) => {
    updateUserStatus(mention, user.status, currentUser);

    // fixme andrei: figure out where to call `off`
    user.on("status-changed", function () {
      updateUserStatus(mention, user.status, currentUser);
    });
  });
}

function updateUserStatus(mention, userStatus, currentUser) {
  removeUserStatus(mention);
  if (userStatus) {
    insertUserStatus(mention, userStatus, currentUser);
  }
}

function insertUserStatus(mention, userStatus, currentUser) {
  const statusHtml = emojiUnescape(`:${userStatus.emoji}:`, {
    class: "user-status",
    title: statusTitle(userStatus, currentUser),
  });
  mention.insertAdjacentHTML("beforeend", statusHtml);
}

function removeUserStatus(mention) {
  const statusElement = mention.querySelector("img.user-status");
  if (statusElement) {
    statusElement.remove();
  }
}

function statusTitle(userStatus, currentUser) {
  if (!userStatus.ends_at) {
    return userStatus.description;
  }

  const _until = until(
    userStatus.ends_at,
    currentUser.timezone,
    currentUser.locale
  );
  return `${userStatus.description} ${_until}`;
}

export default {
  name: "add-user-status-to-inline-mentions",

  initialize(container) {
    const currentUser = container.lookup("service:current-user");

    withPluginApi("0.8", (api) => {
      api.decorateCookedElement(
        (element, helper) => {
          // todo andrei: should be a better way of detecting if it is preview
          const isComposerPreview = !helper;

          if (!isComposerPreview) {
            const post = helper.getModel();
            post.mentioned_users.forEach((user) =>
              applyFlairOnMention(element, user, currentUser)
            );
          }
        },
        { id: "user-status" }
      );
    });
  },
};
