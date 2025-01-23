import { BaseRepository } from "./base";
import { requestApi } from "../api";

class Repository extends BaseRepository {
    getUserTokens = (user, query) =>
        requestApi("get", `${this.path}/user/${user}/tokens?${query}`);
    getRewardsInfo = (data) =>
        requestApi("post", `${this.path}/getRewardsInfo`, data);
    getUserDetails = (data) =>
        requestApi("post", `${this.path}/userDetails`, data);
}

export const UserRepository = new Repository("");
