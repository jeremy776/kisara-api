## 🚀 KiSaRa API

Welcome to KiSaRa! This project is built with the Fastify framework for creating a RESTful API. It's your go-to buddy for spinning up a quick API with ease. We've even got a home endpoint and some neat unit tests using the Node.js Tap library.

### Endpoints 🛣️

| Method | Endpoint               | Route                    | Description                             | Query Parameters | Request Body Parameters |
| ------ | ---------------------- | ------------------------ | --------------------------------------- | ---------------- | ----------------------- |
| GET    | Home Endpoint          | `/`                      | Get cozy with our home page.            | None             | None                    |
| POST   | Local Login/Signup     | `/auth/login`            | Authenticate or sign up locally.        | None             | `username`, `password`  |
| GET    | Discord Authentication | `/auth/discord/callback` | Handle Discord authentication callback. | `code`, `state`  | None                    |
| POST   | Post Comment           | `/message`               | Post a comment.                         | None             | `message_content`, `link_id`               |
| GET    | Get User Comments      | `/message/:id`           | Get comments for a specific user.       | `id` (user ID)   | None                    |

### Rate Limit 🚦

To ensure fair usage and prevent abuse, we've implemented the following rate limits:

| Endpoint          | Rate Limit         |
| ----------------- | ------------------ |
| Entire API        | 60 requests/minute |
| `/auth` router    | 30 requests/minute |
| `/message` router | 45 requests/minute |

These limits help maintain the performance and reliability of the API.

### Environment Variables 🌱

To run this project, you will need to add the following environment variables to your `.env` file.

| Variable                | Description                             | Example Value                                                        |
| ----------------------- | --------------------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL database connection string.  | `postgresql://username:password@localhost:5432/dbname?schema=schema` |
| `DISCORD_CLIENT_ID`     | Your Discord application client ID.     | `YOUR_DISCORD_CLIENT_ID`                                             |
| `DISCORD_CLIENT_SECRET` | Your Discord application client secret. | `YOUR_DISCORD_CLIENT_SECRET`                                         |
| `JWT_SECRET`            | Secret key for signing JWTs.            | `YOUR_JWT_SECRET`                                                    |

Replace the placeholder values with your actual data.

### Installation 🛠️

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AnggaaIs/kisara-api.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd kisara-api
   ```

3. **Install dependencies:**
   ```bash
   yarn install
   ```

### Usage 🚀

1. **Start the server:**

   ```bash
   yarn start
   ```

2. **Access the API via:** `http://localhost:3000`.

### Testing 🧪

To run unit tests, execute:

```bash
yarn test
```

### Contributing 🤝

Got some cool ideas? Contributions are welcome! Feel free to open issues or submit pull requests. Let's build something awesome together!

### License 📝

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).
