const MINUTE_IN_MILLISECONDS = 60 * 1000;

export const getNotificationTime = event => {
  const eventTime = new Date(event.eventAt).getTime();
  const notifyBeforeMinutes = Number(event.notifyBeforeMinutes);

  if (!Number.isFinite(eventTime) || !Number.isFinite(notifyBeforeMinutes)) {
    return null;
  }

  return eventTime - notifyBeforeMinutes * MINUTE_IN_MILLISECONDS;
};

export const isNotificationDue = (event, now = Date.now()) => {
  const notificationTime = getNotificationTime(event);

  return notificationTime !== null && now >= notificationTime;
};
