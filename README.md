# Crear un personalizado useFetch() React Hook

Un enlace personalizado es una función de JavaScript con una convención de nomenclatura única que requiere:

**Tabla de Contenido**

-   [Abstraer fetch en useFetch()](#abstraer-fetch-en-usefetch)
-   [Evitar bucles de referencia](#evitar-bucles-de-referencia)
-   [Error de devolución de useEffect](#error-de-devolución-de-useeffect)
-   [Manejo de Errores](#manejo-de-errores)
-   [Establecer indicadores de carga](#establecer-indicadores-de-carga)
-   [Uso](#uso)
-   [Pensamientos finales](#pensamientos-finales)

1. el nombre de la función para comenzar <code>use</code> y
2. la función puede llamar a otros ganchos

Toda la idea detrás de los ganchos personalizados es solo para que podamos extraer la lógica del componente en funciones reutilizables.

Muchas veces, a medida que desarrollamos aplicaciones React, nos vemos escribiendo casi los mismos códigos exactos en dos o más componentes diferentes. Idealmente, lo que podríamos hacer en tales casos sería extraer esa lógica recurrente en un código reutilizable (gancho) y reutilizarla donde sea necesario.

Antes de los ganchos, compartimos una lógica con estado entre los componentes que utilizan accesorios de renderizado y componentes de orden superior, sin embargo, desde la introducción de los ganchos y desde que llegamos a comprender cuán limpios son estos conceptos, ya no tenía sentido seguir usándolos. Básicamente, cuando queremos compartir la lógica entre dos funciones de JavaScript, la extraemos a una tercera función posiblemente porque tanto los componentes como los enlaces son funciones igualmente justas.

# Abstraer fetch en useFetch()

La razón detrás de este movimiento no es diferente de lo que ya hemos explicado anteriormente. En comparación con el uso de la API nativa de extracción de fábrica, abstraerlo en el <code>useFetch</code> gancho nos brinda una capacidad única, un estilo de código más declarativo, lógica reutilizable y un código general más limpio, como veremos en un minuto. Considere este ejemplo simple de useFetch:

```javascript
const useFetch = (url, options) => {
    const [response, setResponse] = React.useState(null);
    useEffect(async () => {
        const res = await fetch(url, options);
        const json = await res.json();
        setResponse(json);
    });
    return response;
};
```

Aquí, el gancho de efecto llamado useEffect se usa para realizar funciones principales:

recuperar los datos con la API nativa de recuperación y
Establezca los datos en el estado local del componente con la función de actualización del enlace de estado.
Observe también que la resolución de la promesa ocurre con async/await.

# Evitar bucles de referencia

El enlace de efecto se ejecuta en dos ocasiones: cuando el componente se monta y también cuando el componente se actualiza. Lo que esto significa es que, si no se hace nada sobre el ejemplo useFetch anterior, definitivamente nos toparemos con un ciclo de ciclo recurrente aterrador. ¿Por qué? Como establecemos el estado después de cada búsqueda de datos, como resultado, cuando establecemos el estado, el componente se actualiza y el efecto se ejecuta nuevamente.

Obviamente, esto dará como resultado un bucle infinito de obtención de datos y no queremos eso. Lo que sí queremos es recuperar datos solo cuando se monta el componente y tenemos una forma ordenada de hacerlo. Todo lo que tenemos que hacer es proporcionar una matriz vacía como segundo argumento para el enlace de efectos, esto impedirá que se active en las actualizaciones de componentes, pero solo cuando el componente esté montado.

```javascript
useEffect(async () => {
    const res = await fetch(url, options);
    const json = await res.json();
    setResponse(json);
}, []); // empty array
```

El segundo es una matriz que contiene todas las variables de las que depende el gancho. Si alguna de las variables cambia, el gancho se ejecuta nuevamente, pero si el argumento es una matriz vacía, el gancho no se ejecuta al actualizar el componente, ya que no hay variables para observar.

# Error de devolución de useEffect

Es posible que haya notado que en el enlace de efecto anterior, estamos usando async/await para obtener datos. Sin embargo, según las estipulaciones de la documentación, cada función anotada con asíncrono devuelve una promesa implícita. Entonces, en nuestro enlace de efectos, estamos devolviendo una promesa implícita, mientras que un enlace de efectos solo debería devolver nada o una función de limpieza.

Entonces, por diseño, ya estamos rompiendo esta regla porque:

1. No devolvemos nada
2. Una promesa no limpia nada

Como resultado, si continuamos con el código tal como está, recibiremos una advertencia en la consola que señala el hecho de que la función useEffect debe devolver una función de limpieza o nada.
<img src="src/img.png">
En pocas palabras, el uso de funciones asíncronas directamente en la <code>useEffect()</code> función está mal visto. Lo que podemos hacer para solucionar esto es exactamente lo que se recomienda en la advertencia anterior. Escriba la función asíncrona y úsela dentro del efecto.

```javascript
useEffect(() => {
    const fetchData = async () => {
        const res = await fetch(url, options);
        const json = await res.json();
        setResponse(json);
    };
    fetchData();
}, []);
```

En lugar de usar la función asincrónica directamente dentro de la función de efecto, creamos una nueva función asincrónica fetchData()para realizar la operación de recuperación y simplemente llamar a la función dentro de useEffect. De esta manera, cumplimos con la regla de no devolver nada o solo una función de limpieza en un enlace de efecto. Y si vuelve a comprobar en la consola, no verá más advertencias.

# Manejo de Errores

Una cosa que no hemos mencionado o cubierto hasta ahora es cómo podemos manejar los límites de error en este concepto. Bueno, no es complicado, cuando se usa async/await, es una práctica común usar la buena try/catchconstrucción anterior para el manejo de errores y afortunadamente también funcionará para nosotros aquí.

```javascript
const useFetch = (url, options) => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(url, options);
                const json = await res.json();
                setResponse(json);
            } catch (error) {
                setError(error);
            }
        };
        fetchData();
    }, []);
    return {response, error};
};
```

Aquí, utilizamos la muy popular sintaxis JavaScript try/catch para establecer y manejar los límites de error. El error en sí es solo otro estado inicializado con un enlace de estado, por lo que cada vez que se ejecuta el enlace, el estado de error se restablece. Sin embargo, cada vez que hay un estado de error, el componente envía comentarios al usuario o prácticamente puede realizar cualquier operación deseada con él.

# Establecer indicadores de carga

Puede que ya lo sepas, pero sigo sintiendo que será útil señalar que puedes usar ganchos para manejar los estados de carga para tus operaciones de recuperación. Lo bueno es que es solo otra variable de estado administrada por un enlace de estado, por lo que si quisiéramos implementar un estado de carga en nuestro último ejemplo, configuraremos la variable de estado y actualizaremos nuestra <code>useFetch()</code> función en consecuencia.

```javascript
const useFetch = (url, options) => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(url, options);
                const json = await res.json();
                setResponse(json);
                setIsLoading(false);
            } catch (error) {
                setError(error);
            }
        };
        fetchData();
    }, []);
    return {response, error, isLoading};
};
```

# Uso

No podemos completar este tutorial sin trabajar en una demostración práctica para poner en práctica todo lo que hemos hablado. Creemos una mini aplicación que obtenga un montón de imágenes de perros y sus nombres. Usaremos useFetch para llamar a la API de perro muy buena para los datos que necesitaremos para esta aplicación.

Primero definimos nuestra <code>useFetch()</code> función, que es exactamente la misma que hicimos antes. Simplemente reutilizaremos el que creamos mientras demostramos el manejo de errores anterior para explicar el concepto de obtención de datos en la práctica, ya que ya tiene la mayoría de las cosas que necesitaremos.

```javascript
const useFetch = (url, options) => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(url, options);
                const json = await res.json();
                setResponse(json);
            } catch (error) {
                setError(error);
            }
        };
        fetchData();
    }, []);
    return {response, error};
};
```

A continuación, creamos la <code>App()</code> función que realmente utilizará nuestra <code>useFetch()</code> función para solicitar los datos del perro que necesitamos y mostrarlos en la pantalla.

```javascript
const App = () => {
    const res = useFetch("https://dog.ceo/api/breeds/image/random", {});
    if (!res.response) {
        return <div>Loading...</div>;
    }
    const dogName = res.response.status;
    const imageUrl = res.response.message;
    return (
        <div className="App">
            <div>
                <h3>{dogName}</h3>
                <div>
                    <img src={imageUrl} alt="avatar" />
                </div>
            </div>
        </div>
    );
};
```

# Pensamientos finales

La recuperación de datos siempre ha sido un problema con el que lidiar al crear aplicaciones frontend, esto generalmente se debe a todos los casos extremos que deberá tener en cuenta. En esta publicación, explicamos e hicimos una pequeña demostración para explicar cómo podemos obtener datos declarativamente y representarlos en la pantalla utilizando el <code>useFetch</code> enlace con la <code>fetch()</code> API nativa.
# reactjs-usefetch
