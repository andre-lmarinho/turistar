export const EMPTY_ACTIVITY_TITLE = "✍️ Add a title";
export const MAX_FILE_SIZE = 512 * 1024;

export const ACTIVITY_COPY = {
  inlineAdd: {
    collapsedLabel: "Add activity",
    placeholderTitle: EMPTY_ACTIVITY_TITLE,
    ctaAdd: "Add activity",
    ctaCancel: "Cancel",
    a11yGroupLabel: "Add activity inline",
    errorGeneric: "Could not add the activity. Try again.",
  },
} as const;
