require('dotenv').config({ override: true });

const bcrypt = require('bcrypt');
const db = require('../models');
const CONSTANTS = require('../constants');

const createModerator = async () => {
  const email =
    process.env.MODERATOR_EMAIL
      ?.trim()
      .toLowerCase();

  const password =
    process.env.MODERATOR_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'MODERATOR_EMAIL and MODERATOR_PASSWORD are required',
    );
  }

  if (password.length < 8) {
    throw new Error(
      'Moderator password must contain at least 8 characters',
    );
  }

  const existingUser = await db.Users.findOne({
    where: {
      email,
    },
    attributes: ['id', 'email', 'role'],
  });

  if (existingUser) {
    if (
      existingUser.role !== CONSTANTS.MODERATOR
    ) {
      throw new Error(
        'A regular user already exists with this email',
      );
    }

    console.log(
      `Moderator already exists: ${existingUser.email}`,
    );

    return;
  }

  const passwordHash = await bcrypt.hash(
    password,
    CONSTANTS.SALT_ROUNDS,
  );

  const moderator = await db.Users.create({
    firstName:
      process.env.MODERATOR_FIRST_NAME ||
      'System',
    lastName:
      process.env.MODERATOR_LAST_NAME ||
      'Moderator',
    displayName:
      process.env.MODERATOR_DISPLAY_NAME ||
      'Moderator',
    email,
    password: passwordHash,
    role: CONSTANTS.MODERATOR,
    avatar: 'anon.png',
    balance: 0,
    rating: 0,
  });

  console.log(
    `Moderator created with ID ${moderator.id}`,
  );
};

createModerator()
  .catch(error => {
    console.error(
      'Cannot create moderator:',
      error.message,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await db.sequelize.close();
  });
