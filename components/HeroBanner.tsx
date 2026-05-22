"use client";

function HeroBanner() {

  return (
    <div className="w-full z-10">
      <div className="h-screen w-full bg-secondary flex flex-col justify-center items-center">
        <div className="absolute">
          <h1 className="font-primary text-neutral text-9xl">
            RESA
          </h1>
          {/* <div className="z-50 bg-darkColor rounded-2xl py-3 px-6 text-xl font-calSans text-clearColor hover:bg-mainColor duration-100 cursor-pointer hover:border-2 border-darkColor hover:text-darkColor text-center">
            <a href="/contact">Besoin d'un coach ? contactez moi !</a>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
