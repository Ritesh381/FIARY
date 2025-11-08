import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setNavItems } from "../redux/slices/NavItems";

function TheShelf() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      setNavItems([
        { id: 0, type: "link", name: "Home", link: "/shelf" },
        { id: 1, type: "link", name: "Books", link: "/shelf?page=1" },
        { id: 2, type: "link", name: "Movies", link: "/shelf?page=2" },
      ])
    );
  }, [dispatch]);

  return (
    <div>
      <h1>TheShelf</h1>
      <p>
        Here we'll have different sections like Books, Movies, Games, Cources...
      </p>
      <p>
        User can add like what movies he have watched or books and games and
        cources
      </p>
      <p>
        With the data we can recommend him for other movies/books he should try
      </p>
    </div>
  );
}

export default TheShelf;
