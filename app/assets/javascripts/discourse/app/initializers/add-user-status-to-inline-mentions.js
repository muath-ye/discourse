import I18n from "I18n";
import { withPluginApi } from "discourse/lib/plugin-api";
import { cancel } from "@ember/runloop";
import getURL from "discourse-common/lib/get-url";
import { emojiUnescape } from "discourse/lib/text";
import discourseLater from "discourse-common/lib/later";

function applyFlairOnMention(element, username) {
  if (!element) {
    return;
  }

  const href = getURL(`/u/${username.toLowerCase()}`);
  const mentions = element.querySelectorAll(`a.mention[href="${href}"]`);

  mentions.forEach((mention) => {
    if (!mention.querySelector(".on-holiday")) {
      mention.insertAdjacentHTML(
        "beforeend",
        emojiUnescape(":mega:", { class: "on-holiday" })
      );
    }
    mention.classList.add("on-holiday");
  });
}

export default {
  name: "add-user-status-to-inline-mentions",

  initialize() {
    withPluginApi("0.8", (api) => {
      const usernames = [
        "a.prigorshnev_1001",
        "a.prigorshnev_1011",
        "admin1",
        "andrei1",
        "andrei2",
        "andrei3",
        "andrei4",
        "andrei5",
        "andrei6",
        "anonymous",
        "discobot",
        "duplicate",
        "duplicate10",
        "duplicate100",
        "duplicate2",
        "duplicate200",
        "ivan",
        "ivan1",
        "ivan2",
        "kaptah",
        "kaptah1",
        "mjhwl",
        "peter",
        "peter1",
        "peter2",
        "peter4",
        "peter5",
        "system",
        "user1",
      ];

      let flairHandler;

      api.cleanupStream(() => cancel(flairHandler));

      // if (api.decorateChatMessage) {
      //   api.decorateChatMessage((message) => {
      //     usernames.forEach((username) =>
      //       applyFlairOnMention(message, username)
      //     );
      //   });
      // }

      api.decorateCookedElement(
        (element, helper) => {
          if (helper) {
            // decorating a post
            usernames.forEach((username) =>
              applyFlairOnMention(element, username)
            );
          } else {
            // decorating preview
            cancel(flairHandler);
            flairHandler = discourseLater(
              () =>
                usernames.forEach((username) =>
                  applyFlairOnMention(element, username)
                ),
              1000
            );
          }
        },
        { id: "user-status" }
      );
    });
  },
};
