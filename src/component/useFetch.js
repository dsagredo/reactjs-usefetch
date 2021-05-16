import {useState, useEffect} from "react";
import axios from "axios";

const useFetch = (url) => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const FetchData = async () => {
            try {
                const res = await axios.get(url);
                const {data} = res;
                setResponse(data);
            } catch (error) {
                setError(error.message);
            }
        };
        FetchData();
    }, [url]);

    return {response, error};
};

export default useFetch;
