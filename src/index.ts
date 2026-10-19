import { bootstrap } from "./bootstrap";

bootstrap().catch((error) => {
  console.error("failed to start server", error);
  process.exit(1);
});