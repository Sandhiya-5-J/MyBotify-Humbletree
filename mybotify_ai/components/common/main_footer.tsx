const MainFooter = () => {
  return (
    <footer className="text-center text-gray-500 py-3 w-full text-xs mt-auto">
      by interacting with <span className="text-[#162120]">MyBotify</span>, you
      agree to the
      <a href="/terms" className="text-[#162120]">
        {" "}
        Terms of Use{" "}
      </a>{" "}
      and confirm you have reviewed the
      <a href="/privacy" className="text-[#162120]">
        {" "}
        Privacy Statement
      </a>
      .
    </footer>
  );
};

export default MainFooter;
