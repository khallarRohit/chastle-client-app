import { cookies } from "next/headers";


export async function fetchGraphQL<T>(query: string, variables = {}) {

    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  // This is just a standard HTTP request!
    const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        headers: { 
        'Content-Type': 'application/json',
        'Cookie': allCookies
    },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
    });

    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data as T;
}