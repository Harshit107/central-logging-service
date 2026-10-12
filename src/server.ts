import app from "./app";
import { DEFAULT_CONFIG } from "./constants";

const PORT = process.env.PORT || DEFAULT_CONFIG.PORT;

const server = app.listen(PORT, () => {
  console.log(`Central Logging Service (TypeScript) started on port ${PORT}`);
});

export default server;
