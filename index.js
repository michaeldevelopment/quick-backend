const app = require("./app");
const http = require("http");
const config = require("./config");
const { DATABASE, PORT } = config;
const { connect } = require("./database");

connect({
  url: DATABASE.url,
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
