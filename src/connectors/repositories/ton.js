import { BaseRepository } from "./base";
import { requestApiTon } from "../apiTon";


class Repository extends BaseRepository {
  getTokens = (query) =>
    requestApiTon("get", `${this.path}/tokens?${query}`);
}

export const TonRepository = new Repository("");
