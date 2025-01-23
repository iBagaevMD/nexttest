import { BaseRepository } from "./base";
import { requestApi } from "../api";

class Repository extends BaseRepository {
  getTokens = (query) =>
    requestApi("get", `${this.path}/tokens?${query}`);
  getUpdateTokens = () =>
      requestApi("get", `${this.path}/update`);
}

export const SolanaRepository = new Repository("");
