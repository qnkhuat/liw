import { storage } from "../lib/firebase/client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import Button from '@material-ui/core/Button';

export default function FirebaseUpload({className, label, accept, onComplete, prefix, id}) {
  const intputId = id || uuidv4();

  function upload(e){
    if (!e.target.files) return;
    const file = e.target.files[0];
    const filename = file.name;
    const filenameSplit = filename.split(".");
    const dest = `img/${prefix ? `${prefix}/` : ""}${uuidv4()}.${filenameSplit[filenameSplit.length - 1]}`;
    const storageRef = ref(storage, dest);
    const task = uploadBytesResumable(storageRef, file);
    task.on('state_changed', 
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      },
      (error) => {
        console.error("Failed to upload: ", error);
      },() => {
        getDownloadURL(task.snapshot.ref).then((downloadUrl) => {
          console.log("upload done");
          if (onComplete) {
            console.log(dest, downloadUrl);
            onComplete(dest, downloadUrl);
          }
        });
      }
    );
  }

  return (
    <>
      <input
        id={intputId}
        className="hidden"
        accept={accept || "image/*"}
        type="file"
        onChange={upload}
      />
      <label htmlFor={intputId}>
        <Button variant="contained" color="primary" component="span" 
          className={className || ""}>
          {label || "Upload"}
        </Button>
      </label>
    </>
  )
}
