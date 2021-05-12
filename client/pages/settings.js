import { useState, useEffect } from "react";
import { useRouter } from 'next/router';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';

import { useAuth, withAuth } from '../lib/firebase/auth';
import { formatDate  } from "../lib/util";

import FirebaseUpload from "../components/FirebaseUpload";
import Loading from "../components/Loading";
import Layout from "../components/Layout";

import urljoin from "url-join";
import axios from "axios";

function Settings() {
  const { auth, refreshUser, loading } = useAuth();

  const [ user, setUser ] = useState(null);
  const [ updated, setUpdated ] = useState(false);
  const [ fullname, setFullname ] = useState(auth.displayName || null);
  const [ username, setUsername ] = useState(null);
  const [ birthday, setBirthday ] = useState(null);
  const [ maxAge, setMaxAge ] = useState(100);
  const [ about, setAbout ] = useState(null);
  const [ avatar, setAvatar] = useState(null);
  const [ displayAvatar, setDisplayAvatar] = useState(null);

  const router = useRouter();

  function handleUpdateComplete (path, url) {
    setAvatar(path);
    setDisplayAvatar(url);
  }

  useEffect(() => {
    if (!updated){
      refreshUser().then((user) => {
        if (!user) return;
        setUser(user);
        setFullname(user.user.fullname);
        setUsername(user.user.username);
        setBirthday(user.user.birthday);
        setBirthday(formatDate(user?.user.birthday, "YYYY-MM-DD"));
        setMaxAge(user.user.maxAge);
        setAbout(user.user.about);
        setAvatar(user.user.avatar);
        setDisplayAvatar(user.user.avatar);
      }).catch((error) => console.error("Error fetching user info: ", error)).finally(() => setUpdated(true));
    }
  })

  if (!updated || loading) return <Loading />;

  async function submit(){
    if (user) { // Update
      let payload = {
        ...(fullname != user?.user.fullname) && {fullname: fullname},
        ...(username != user?.user.username) && {username: username},
        ...(birthday != user?.user.birthday) && {birthday: new Date(birthday)},
        ...(maxAge != user?.user.maxAge) && {maxAge: maxAge},
        ...(about != user?.user.about ) && {about: about},
        ...(avatar!= user?.user.avatar) && {avatar: avatar},
      }
      if(Object.keys(payload).length > 0){
        await axios.patch(urljoin(process.env.BASE_URL,`/api/user/${user.id}`), payload).then(( res ) => {
          if (res.status == 200) alert("success");
          refreshUser();
        }).catch(( error ) => {
          console.error("Some thing is wrong: ", error);
        })
      }
    } else { // Add user
      const payload = {
        id: auth.uid,
        user: {
          username: username,
          fullname: fullname,
          birthday: birthday,
          maxAge: maxAge,
          email: auth.email,
          about: about,
          avatar: avatar
        }
      }
      await axios.post(urljoin(process.env.BASE_URL, "/api/user"), payload).then(( res ) => {
        if (res.status == 200) {
          refreshUser().then((res) => {
            router.push("/[username]", `/${username}`);
          }).catch((error) => {
            router.push(`/404`);
          })
        }
      }).catch(( error ) => {
        console.log("Recheck your form bitch: ", error);
      })
    }

  }

  return (
    <Layout>
      <form key={updated} className="" noValidate autoComplete="off" className="flex flex-col items-center">
        <div className="relative">
          <Avatar
            className="w-32 h-32 text-4xl border rounded-full shadow mb-4"
            alt={fullname}
            src={displayAvatar || "/fake-image.jpg"}
          >
          </Avatar>

          <FirebaseUpload id="profile-avatar" onComplete={ handleUpdateComplete } prefix={username}  className="bg-black">
            <IconButton component="span"
              className="outline-none absolute right-2 bottom-2 bg-blue-400 bg-opacity-40 p-2"
              aria-label="Search">
              <PhotoCameraIcon fontSize="small"></PhotoCameraIcon>
            </IconButton>
          </FirebaseUpload>

        </div>

        <TextField id="profile-username" 
          defaultValue={username}
          onChange={(e) => setUsername(e.target.value)}
          label="Username" 
          variant="outlined" 
          required/>


        <TextField id="profile-fullname" 
          defaultValue={fullname}
          label="Full name" 
          variant="outlined" 
          onChange={(e) => setFullname(e.target.value)}
          required/>

        <TextField id="profile-birthday" 
          defaultValue={birthday}
          onChange={(e) => setBirthday(new Date(e.target.value))}
          label="Birthday" 
          variant="outlined" 
          type="date"
          InputLabelProps={{shrink: true}}
          required/>

        <TextField id="profile-maxage" 
          onChange={(e) => setMaxAge(e.target.value)}
          defaultValue={maxAge}
          label="Life expectency" 
          variant="outlined" 
          type="number" 
        />

        <TextField id="profile-email" 
          label="Email" 
          disabled
          variant="outlined"           
          defaultValue={auth.email}
          InputProps={{readOnly: true}}
          required
        />

        <TextField id="profile-about" 
          onChange={(e) => setAbout(e.target.value)}
          defaultValue={about}
          multiline
          rows={3}
          label="About yourself" 
          variant="outlined" />


        <Button id="profile-submit" variant="outlined" color="primary" onClick={submit}>
          Submit
        </Button>
      </form>
    </Layout>
  )
}

export default withAuth(Settings, false, "/login");
