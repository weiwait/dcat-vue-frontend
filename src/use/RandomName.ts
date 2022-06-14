import {Md5} from "ts-md5";

export function useRandomName(name: string, suffix = '') {
    suffix = suffix ? '.' + suffix : name.substring(name.lastIndexOf('.'))
    return Md5.hashStr(name + Math.random().toString()) + suffix
}