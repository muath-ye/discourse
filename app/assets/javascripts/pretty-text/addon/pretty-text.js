import {
  cook as cookIt,
  setup as setupIt,
} from "pretty-text/engines/discourse-markdown-it";
import { deepMerge } from "discourse-common/lib/object";
import deprecated from "discourse-common/lib/deprecated";

export function registerOption() {
  deprecated(
    "`registerOption() from `pretty-text` is deprecated. Use `helper.registerOptions()` instead.",
    {
      since: "2.8.0.beta9",
      dropFrom: "2.9.0.beta1",
    }
  );
}

export function buildOptions(state) {
  const {
    siteSettings,
    getURL,
    lookupAvatar,
    lookupPrimaryUserGroup,
    getTopicInfo,
    topicId,
    categoryHashtagLookup,
    userId,
    getCurrentUser,
    currentUser,
    lookupAvatarByPostNumber,
    lookupPrimaryUserGroupByPostNumber,
    formatUsername,
    emojiUnicodeReplacer,
    lookupUploadUrls,
    previewing,
    linkify,
    censoredRegexp,
    disableEmojis,
    customEmojiTranslation,
    watchedWordsReplace,
    watchedWordsLink,
  } = state;

  let features = {
    "bold-italics": true,
    "auto-link": true,
    mentions: true,
    bbcode: true,
    quote: true,
    html: true,
    "category-hashtag": true,
    onebox: true,
    linkify: linkify !== false,
    newline: !siteSettings.traditional_markdown_linebreaks,
  };

  if (state.features) {
    features = deepMerge(features, state.features);
  }

  const options = {
    sanitize: true,
    getURL,
    features,
    lookupAvatar,
    lookupPrimaryUserGroup,
    getTopicInfo,
    topicId,
    categoryHashtagLookup,
    userId,
    getCurrentUser,
    currentUser,
    lookupAvatarByPostNumber,
    lookupPrimaryUserGroupByPostNumber,
    formatUsername,
    emojiUnicodeReplacer,
    lookupUploadUrls,
    censoredRegexp,
    customEmojiTranslation,
    allowedHrefSchemes: siteSettings.allowed_href_schemes
      ? siteSettings.allowed_href_schemes.split("|")
      : null,
    allowedIframes: siteSettings.allowed_iframes
      ? siteSettings.allowed_iframes.split("|")
      : [],
    markdownIt: true,
    injectLineNumbersToPreview:
      siteSettings.enable_advanced_editor_preview_sync,
    previewing,
    disableEmojis,
    watchedWordsReplace,
    watchedWordsLink,
  };

  // note, this will mutate options due to the way the API is designed
  // may need a refactor
  setupIt(options, siteSettings, state);

  return options;
}

export default class {
  constructor(opts) {
    if (!opts) {
      opts = buildOptions({ siteSettings: {} });
    }
    this.opts = opts;
  }

  disableSanitizer() {
    this.opts.sanitizer = this.opts.discourse.sanitizer = (ident) => ident;
  }

  cook(raw) {
    if (!raw || raw.length === 0) {
      return "";
    }

    let result;
    result = cookIt(raw, this.opts);
    return result ? result : "";
  }

  sanitize(html) {
    return this.opts.sanitizer(html).trim();
  }
}
