import React from "react";
import useFetch from "./component/useFetch";

const App = () => {
    const res = useFetch(`https://dog.ceo/api/breeds/image/random`);
    const {response} = res;

    if (!response) {
        return <div>Cargando...</div>;
    }

    const render = () => {
        const {status, message} = response;
        return (
            <div className="App">
                <div>
                    <h3>{status}</h3>
                    <div>
                        <img src={message} alt="avatar" />
                    </div>
                </div>
            </div>
        );
    };

    return render();
};

export default App;
