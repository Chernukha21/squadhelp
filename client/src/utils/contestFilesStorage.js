const contestFiles = new Map();

export const setContestFile = (contestType, file) => {
  if (file instanceof File) {
    contestFiles.set(contestType, file);
  } else {
    contestFiles.delete(contestType);
  }
};

export const getContestFile = contestType =>
  contestFiles.get(contestType) ?? null;

export const clearContestFiles = () => {
  contestFiles.clear();
};
