import {Md5} from "ts-md5";

export function useRandomName(name: string) {
    const suffix = name.substring(name.lastIndexOf('.'))
    return Md5.hashStr(name + Math.random().toString()) + suffix
}