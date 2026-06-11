import React from "react"
// Image will be served from the public folder
import "./Home.css";
import AllRecipes from "../components/AllRecipes";


function Home({ onShareClick }) {
    return (
        <div>
            <section className="home">
                <div className="left">
                    <h1>Share You Favorite Recipe with The World</h1>
                    <p>Join Our Cooking Community and Share Your Recipes with world.
                        Discover new recipes and connect with food lovers around the globe.</p>
                    <button className="btn" onClick={onShareClick}>Share Your Recipe</button>
                </div>
                <div className="right">
                    <img src="/img1.png" alt="Recipe" width={350} height={350} />

                </div>
            </section>
            <div className="bg">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ff5500" fill-opacity="1" d="M0,128L18.5,149.3C36.9,171,74,213,111,218.7C147.7,224,185,192,222,181.3C258.5,171,295,181,332,170.7C369.2,160,406,128,443,138.7C480,149,517,203,554,208C590.8,213,628,171,665,149.3C701.5,128,738,128,775,154.7C812.3,181,849,235,886,250.7C923.1,267,960,245,997,234.7C1033.8,224,1071,224,1108,229.3C1144.6,235,1182,245,1218,250.7C1255.4,256,1292,256,1329,261.3C1366.2,267,1403,277,1422,282.7L1440,288L1440,320L1421.5,320C1403.1,320,1366,320,1329,320C1292.3,320,1255,320,1218,320C1181.5,320,1145,320,1108,320C1070.8,320,1034,320,997,320C960,320,923,320,886,320C849.2,320,812,320,775,320C738.5,320,702,320,665,320C627.7,320,591,320,554,320C516.9,320,480,320,443,320C406.2,320,369,320,332,320C295.4,320,258,320,222,320C184.6,320,148,320,111,320C73.8,320,37,320,18,320L0,320Z"></path></svg>

            </div>





            <AllRecipes />
        </div>
    )
}


export default Home;

