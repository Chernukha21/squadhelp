/* global db */

db.getCollection('messages').aggregate([
  {
    $match: {
      body: {
        $regex: '(^|[^\\p{L}\\p{N}_])паровоз([^\\p{L}\\p{N}_]|$)',
        $options: 'i',
      },
    },
  },
  {
    $count: 'count',
  },
]);
