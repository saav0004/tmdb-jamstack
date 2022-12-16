class NetworkError extends Error {
  constructor(msg, response) {
    super(msg);
    this.name = "NetworkError";
    this.response = response;
    this.status = response.status;
    this.statusText = response.statusText;
  }
}

export { NetworkError };
