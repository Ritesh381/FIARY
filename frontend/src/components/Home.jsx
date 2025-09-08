import React, { useState } from "react";
import Hero from "./Hero";
import HomeCal from "./HomeCal";

const Home = () => {
  return (
    <div>
      <Hero />
      <hr className="my-10 border-t border-gray-700" />
      <HomeCal />
    </div>
  );
};

export default Home;
