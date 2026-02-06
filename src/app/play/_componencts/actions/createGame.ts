'use server'

import { redirect } from 'next/navigation';
import { fetchGraphQL } from '@/lib/graphql/fetchGraphql'; // The helper we created earlier
import { CREATE_GAME_MUTATION } from '@/lib/graphql/mutations/playMutations';
import { Color, CreateGameResponse, GameVariant } from '@/generated/graphql';

export async function createGame(formData: FormData) {

    // 1. Extract values from the form
    const side = formData.get('side') as Color;
    const minutes = Number(formData.get('minutes'));
    const increment = Number(formData.get('increment'));
    const rated = Number(formData.get('rated'));

    const variant:GameVariant = minutes <= 3 ? GameVariant.Bullet 
    : (minutes <= 14 ? GameVariant.Blitz : GameVariant.Rapid);
    const timeControl =  String(minutes) + '+' + String(increment);

    try {
        console.log(variant, timeControl, side, rated);
        const response = await fetchGraphQL<CreateGameResponse>(
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

        console.log(response);

        // lobbyId = response.createLobby.id;
        
    } catch (error) {
        console.error("Failed to create lobby:", error);
        throw new Error("Failed to create lobby.");
    }

    // 3. Redirect to the new game lobby
    // Note: Redirects must happen outside try/catch in Server Actions
    //   redirect(`/game/${lobbyId}`);
}