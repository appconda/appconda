import { DSN } from "../../Tuval/DSN";
import { Device, Local, Storage } from "../../Tuval/Storage";

export function getDevice(root: string): Device {
    const connection = process.env._APP_CONNECTIONS_STORAGE || '';

    if (connection) {
        let dsn: DSN;
        let device = Storage.DEVICE_LOCAL;
        let accessKey = '';
        let accessSecret = '';
        let bucket = '';
        let region = '';
        const acl = 'private';

        try {
            dsn = new DSN(connection);
            device = dsn.getScheme();
            accessKey = dsn.getUser() || '';
            accessSecret = dsn.getPassword() || '';
            bucket = dsn.getPath() || '';
            region = dsn.getParam('region') || '';
        } catch (e: any) {
            console.warn(`${e.message} Invalid DSN. Defaulting to Local device.`);
        }

        switch (device) {
            /*  case Storage.DEVICE_S3:
                 return new S3(root, accessKey, accessSecret, bucket, region, acl);
             case Storage.DEVICE_DO_SPACES:
                 const doSpaces = new DOSpaces(root, accessKey, accessSecret, bucket, region, acl);
                 doSpaces.setHttpVersion(S3.HTTP_VERSION_1_1);
                 return doSpaces;
             case Storage.DEVICE_BACKBLAZE:
                 return new Backblaze(root, accessKey, accessSecret, bucket, region, acl);
             case Storage.DEVICE_LINODE:
                 return new Linode(root, accessKey, accessSecret, bucket, region, acl);
             case Storage.DEVICE_WASABI:
                 return new Wasabi(root, accessKey, accessSecret, bucket, region, acl);
             case Storage.DEVICE_LOCAL: */
            default:
                return new Local(root);
        }
    } else {
        switch (process.env._APP_STORAGE_DEVICE?.toLowerCase() || Storage.DEVICE_LOCAL) {
            /* case Storage.DEVICE_S3:
                return new S3(
                    root,
                    process.env._APP_STORAGE_S3_ACCESS_KEY || '',
                    process.env._APP_STORAGE_S3_SECRET || '',
                    process.env._APP_STORAGE_S3_BUCKET || '',
                    process.env._APP_STORAGE_S3_REGION || '',
                    'private'
                );
            case Storage.DEVICE_DO_SPACES:
                const doSpaces = new DOSpaces(
                    root,
                    process.env._APP_STORAGE_DO_SPACES_ACCESS_KEY || '',
                    process.env._APP_STORAGE_DO_SPACES_SECRET || '',
                    process.env._APP_STORAGE_DO_SPACES_BUCKET || '',
                    process.env._APP_STORAGE_DO_SPACES_REGION || '',
                    'private'
                );
                doSpaces.setHttpVersion(S3.HTTP_VERSION_1_1);
                return doSpaces;
            case Storage.DEVICE_BACKBLAZE:
                return new Backblaze(
                    root,
                    process.env._APP_STORAGE_BACKBLAZE_ACCESS_KEY || '',
                    process.env._APP_STORAGE_BACKBLAZE_SECRET || '',
                    process.env._APP_STORAGE_BACKBLAZE_BUCKET || '',
                    process.env._APP_STORAGE_BACKBLAZE_REGION || '',
                    'private'
                );
            case Storage.DEVICE_LINODE:
                return new Linode(
                    root,
                    process.env._APP_STORAGE_LINODE_ACCESS_KEY || '',
                    process.env._APP_STORAGE_LINODE_SECRET || '',
                    process.env._APP_STORAGE_LINODE_BUCKET || '',
                    process.env._APP_STORAGE_LINODE_REGION || '',
                    'private'
                );
            case Storage.DEVICE_WASABI:
                return new Wasabi(
                    root,
                    process.env._APP_STORAGE_WASABI_ACCESS_KEY || '',
                    process.env._APP_STORAGE_WASABI_SECRET || '',
                    process.env._APP_STORAGE_WASABI_BUCKET || '',
                    process.env._APP_STORAGE_WASABI_REGION || '',
                    'private'
                ); */
            case Storage.DEVICE_LOCAL:
            default:
                return new Local(root);
        }
    }
}