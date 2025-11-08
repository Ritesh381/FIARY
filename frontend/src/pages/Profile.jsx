import React, { useEffect } from 'react'
import { setNavItems } from "../redux/slices/NavItems";
import { useDispatch } from 'react-redux';

function Profile() {
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(setNavItems([
        { id: 0, type: "link", name: "Profile", link: "/profile" },
        { id: 1, type: "link", name: "Settings", link: "/profile?page=1" },
    ]));
  }, [dispatch]);

  return (
    <div>Here user will be able to edit his profile like adding profile image, changing name and bio and all.</div>
  )
}

export default Profile