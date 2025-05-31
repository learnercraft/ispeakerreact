declare global {
    interface Window {
        electron: {
            openExternal: (url: string) => Promise<void>;
            saveRecording: (key: string, arrayBuffer: ArrayBuffer) => Promise<unknown>;
            checkRecordingExists: (key: string) => Promise<unknown>;
            playRecording: (key: string) => Promise<unknown>;
            ipcRenderer: {
                invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
                send: (channel: string, ...args: unknown[]) => void;
                on: (channel: string, func: (...args: unknown[]) => void) => void;
                removeAllListeners: (channel: string) => void;
                removeListener: (channel: string, func: (...args: unknown[]) => void) => void;
            };
            getDirName: () => string;
            isUwp: () => boolean | undefined;
            send: (channel: string, data: unknown) => void;
            log: (level: string, message: string) => void;
            getRecordingBlob: (key: string) => Promise<unknown>;
            getFfmpegWasmPath: () => Promise<unknown>;
            getFileAsBlobUrl: (filePath: string, mimeType: string) => Promise<string>;
        };
    }
}

export {};
