export type BaseField = {
    name: string,
    column: string,
    value: any,
    attributes: any,
    disabled: Array<string | number>,
    options: any,
    checked: Array<string | number>,
    watch: Array<any>,
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
}
