
import * as fs from 'fs';
export function FindAllFiles(dir = './app', files_ = []) {
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            FindAllFiles(name, files_);
        } else {
            if (name.endsWith('js'))
            files_.push(name.replace('.js', ''));
        }
    }
    return files_;
}