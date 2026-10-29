## Environment configuration

Create `server/.env` from the provided example:

```bash
cp server/.env.example server/.env
```

Replace all placeholder values with real local values.

Do not commit `server/.env` because it contains private credentials.

## Database migrations

Start the development containers and apply the Sequelize migrations:

```bash
docker compose -f docker-compose-dev.yaml up -d --build
docker compose -f docker-compose-dev.yaml exec -T server-dev npx sequelize-cli db:migrate
```

The migrations add the Moderator role and the moderation status for offers.

## Creating a moderator

A Moderator cannot be created through public registration.

To create one, temporarily add the following values to `server/.env`:

```env
MODERATOR_EMAIL=moderator@example.com
MODERATOR_PASSWORD=your-strong-password
```

Run:

```bash
docker compose -f docker-compose-dev.yaml exec -T server-dev npm run create:moderator
```

Expected output:

```text
Moderator created with ID 1
```

The script:

- creates a user with the `moderator` role;
- hashes the supplied password;
- does not promote an existing Customer or Creative account;
- does not create a duplicate Moderator with the same email.

After the Moderator is created, remove these variables from `server/.env`:

```env
MODERATOR_EMAIL
MODERATOR_PASSWORD
```

The Moderator signs in through the regular login form and is redirected to:

```text
/moderator/offers
```

## Email notifications

When a Moderator approves or rejects an offer, the Creative receives an email with the moderation decision.

The server uses Nodemailer and SMTP. Configure these values in `server/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM="Squadhelp <your-email@gmail.com>"
```

### Gmail configuration

1. Use a dedicated Gmail account for the project.
2. Enable two-step verification for that account.
3. Open [Google App Passwords](https://myaccount.google.com/apppasswords).
4. Create an App Password for the project.
5. Set the generated App Password as `SMTP_PASSWORD`.
6. Do not use the regular Google account password.

The email is sent from `SMTP_USER` to the email stored in the Creative's user account.

### Testing the SMTP connection

Run:

```bash
docker compose -f docker-compose-dev.yaml exec -T server-dev node -e "require('dotenv').config(); const { verifyEmailConnection } = require('./src/services/emailService'); verifyEmailConnection().then(() => { console.log('SMTP connection OK'); process.exit(0); }).catch(error => { console.error(error); process.exit(1); });"
```

Expected output:

```text
SMTP connection OK
```

If `SELF_SIGNED_CERT_IN_CHAIN` appears, check whether antivirus software or a proxy is intercepting outgoing SMTP connections. Do not disable TLS certificate verification in the application.
