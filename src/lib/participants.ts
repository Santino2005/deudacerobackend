import { createClient } from '@/lib/supabase/client'
import { saveParticipantId } from './participantStorage'

const supabase = createClient()

export async function createParticipant(
    firstName: string,
    lastName: string,
    email: string,
    age: number
) {
    const { data, error } = await supabase
        .from('participants')
        .insert({
            first_name: firstName,
            last_name: lastName,
            email,
            age,
        })
        .select('id')
        .single()

    if (error) {
        throw error
    }

    saveParticipantId(data.id)

    return data.id
}