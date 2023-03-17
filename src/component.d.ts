export declare type BaseField = {
    [key: string]: any,
    name: string,
    column: string|object,
    value: any,
    attributes: {
        [key: string]: any,
        disabled: boolean|undefined,
        required: boolean|undefined,
    },
    disabled: Array<string | number>,
    options: any,
    checked: Array<string | number>,
    obs: {
        oss: {
            dir: string,
            policy: string,
            accessid: string,
            expire: number,
            host: string,
            signature: string,
            callback: string,
        }
    },
    disk: any,
    uploaded_url: string,
    obs_config_url: string,
    dir: string,
    multiple: boolean,
    help: {icon: string, text: string},
    vid: string,
    watches: [{field: string, handler: string}],
}

declare interface Watch {
    field: string,
    handler: string,
}
