import dynamic from 'next/dynamic';
import { useState, useEffect } from "react";import { useRouter } from 'next/router';
import axios from "axios";
import { useAuth, withAuth } from '../lib/firebase/auth';
import urljoin from "url-join";
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Backdrop from '@material-ui/core/Backdrop';
import Modal from '@material-ui/core/Modal';

import FirebaseUpload from "../components/FirebaseUpload";
import StoriesList from "../components/Story/StoriesList";
import Upsert from '../components/Story/Upsert';

import IconButton from "@material-ui/core/IconButton";
import AddIcon from '@material-ui/icons/Add';
import { parseCookies, setCookie, destroyCookie } from 'nookies'

function Edit() {
  const router = useRouter();
  const cookies = parseCookies()
  const user = "user" in cookies ? JSON.parse(cookies.user) : null;

  const [ stories, setStories] = useState(null);
  const [ fullname, setFullname ] = useState(user.fullname);
  const [ birthday, setBirthday ] = useState(user.birthday);
  const [ maxAge, setMaxAge ] = useState(user.maxAge);
  const [ about, setAbout ] = useState(user.about);
  const [ avatar, setAvatar] = useState(user.avatar);


  if (!user) return router.push("/login?next=/edit");

  useEffect(() => {
    if(stories == null) {// call it once
      const stories_req = axios.get(urljoin(process.env.BASE_URL, `/api/user/${user.username}/stories`)).then((res) => {
      //const stories_req = axios.get(urljoin(process.env.BASE_URL, `/api/user/${user.id}/stories`)).then((res) => {
        setStories(res.data);
      }).catch((error) => console.log("We are fucked: ", error));
    }
  })

  if (!user) {
    return <h3> Hang in there </h3>

  }
  const [openAdd, setOpenAdd] = useState(false);

  function handleOpenAdd() {setOpenAdd(true)};
  function handleCloseAdd() {setOpenAdd(false)};

  const { auth, refreshUser } = useAuth();

  function updateProfile(){
    let payload = {
      ...(fullname != user.fullname) && {fullname: fullname},
      ...(birthday != user.birthday) && {birthday: birthday},
      ...(maxAge != user.maxAge) && {maxAge: maxAge},
      ...(about != user.about ) && {about: about},
      ...(avatar!= user.avatar) && {avatar: avatar},
    }
    if (Object.keys(user).length > 0){
      axios.patch(urljoin(process.env.BASE_URL,`/api/user/${user.id}`), payload).then(( res ) => {
        if (res.status == 200) alert("success");
        refreshUser();
      }).catch(( error ) => {
        console.error("Some thing is wrong: ", error);
      })
    }
  }

  function handleStoryAdded(storyId, story){
    stories[storyId] = story
    setStories(stories);
    handleCloseAdd();
  }

  return (
    <div className="container mx-auto">
      <form id="form-profile" noValidate autoComplete="off" className="flex flex-col mt-40">
        <h3>Update your profile bitch</h3>
        <TextField id="profile-fullname" 
          label="Full name" 
          variant="outlined" 
          onChange={(e) => setFullname(e.target.value)}
          defaultValue={fullname}
          required
        />

        <TextField id="profile-username" 
          label="Username" 
          disabled
          defaultValue={user.username}
          variant="outlined" 
          required/>

        <TextField id="profile-birthday" 
          onChange={(e) => setBirthday(e.target.value)}
          label="Birthday" 
          variant="outlined" 
          type="date"
          defaultValue={birthday}
          InputLabelProps={{shrink: true}}
          required/>

        <TextField id="profile-maxage" 
          onChange={(e) => setMaxAge(e.target.value)}
          label="MaxAge" 
          variant="outlined" 
          defaultValue={maxAge}
          type="number" 
          defaultValue={100}
          required/>

        <TextField id="profile-email" 
          label="Email" 
          disabled
          variant="outlined"           
          defaultValue={user.email}
          InputProps={{ readOnly: true}}
        />

        <TextField id="profile-about" 
          onChange={(e) => setAbout(e.target.value)}
          defaultValue={about}
          label="About your self" 
          multiline
          variant="outlined" />

        <img src={avatar} alt={user.username}/>
        <FirebaseUpload id="profile-avatar" prefix={user.username} className="bg-black" onComplete={(path, url) => setAvatar(path)}/>

        <Button id="profile-submit" variant="outlined" color="primary" onClick={updateProfile}>
          Submit
        </Button>
      </form>
      <div className="add-button">
        <IconButton 
          onClick={handleOpenAdd} 
          aria-label="edit" color="primary">
          <AddIcon fontSize="small"></AddIcon>
        </IconButton>

        <Modal
          BackdropComponent={Backdrop}
          open={openAdd}
          onClose={handleCloseAdd}
          aria-labelledby="child-modal-title"
          aria-describedby="child-modal-description"
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 w-auto" >
            <Upsert onComplete={handleStoryAdded}/>
          </div>
        </Modal>
        <StoriesList stories={stories != null ? stories : {}} />
      </div>

    </div>
  )
}

export default dynamic(() => Promise.resolve(withAuth(Edit, false, "/403")), {
  ssr: false
})