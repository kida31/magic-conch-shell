import { ActivityOptions, ActivityType } from "discord.js";

export class ActivityTemplates {
    static WatchingOverYou(other: string): [string, ActivityOptions] {
        return ["over you | " + other, { type: ActivityType.Watching }]
    }

    static PlayingMusic(other: string): [string, ActivityOptions] {
        return ["music | " + other, { type: ActivityType.Playing }]
    }

    static PlayingWithYourHeart(other: string): [string, ActivityOptions] {
        return ["with your heart | " + other, { type: ActivityType.Playing }]
    }
    static Random(other: string): [string, ActivityOptions] {
        const options = [
            this.WatchingOverYou,
            this.PlayingMusic,
            this.PlayingWithYourHeart,
        ];
        return options[Math.floor(Math.random() * options.length)](other);
    }
}