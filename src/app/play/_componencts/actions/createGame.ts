'use server'

import { redirect } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphql/fetchGraphql'; // The helper we created earlier
import { CREATE_GAME_MUTATION, CreateGameVariables } from '@/lib/graphql/mutations/playMutations';

export async function createGame(formData: FormData) {

  // 1. Extract values from the form
  const side = formData.get('side') as string;
  const minutes = Number(formData.get('minutes'));
  const increment = Number(formData.get('increment'));
  const rated = Number(formData.get('rated'));

  const variant = minutes <= 3 ? "bullet" : (minutes <= 14 ? "blitz" : "rapid");
  const timeControl =  String(minutes) + '+' + String(increment);



  try {
    console.log(variant, timeControl, side, rated);
    const response = await fetchGraphQL<CreateGameVariables>(
      CREATE_GAME_MUTATION,
      {
        data: { 
            variant,
            timeControl,
            color: side,
            rated: (rated ? true : false)
        }
      }
    );

    // lobbyId = response.createLobby.id;
    
  } catch (error) {
    console.error("Failed to create lobby:", error);
    // In a real app, you might return an error state to display on the form
    return { error: "Failed to create lobby" };
  }

  // 3. Redirect to the new game lobby
  // Note: Redirects must happen outside try/catch in Server Actions
//   redirect(`/game/${lobbyId}`);
}