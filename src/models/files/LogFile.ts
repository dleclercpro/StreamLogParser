import { createFile, deleteFile, touchFile } from '../../utils/file';
import PipeRead from '../streams/base/PipeRead';
import PipeWrite from '../streams/base/PipeWrite';

abstract class LogFile {
    protected path: string;
    protected pipeFrom?: PipeRead;
    protected pipeTo?: PipeWrite;

    constructor(path: string) {
        this.path = path;
    }

    public getPath() {
        return this.path;
    }

    public getPipeFrom() {
        return new PipeRead(this.path);
    }

    public getPipeTo() {
        return new PipeWrite(this.path);
    }

    public async touch() {
        const isNew = await touchFile(this.path);
        return isNew;
    }

    public async create() {
        await createFile(this.path);
    }

    public async delete() {
        await deleteFile(this.path);
    }
}

export default LogFile;