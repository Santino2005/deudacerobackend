import { createClient } from '@/lib/supabase/client'
import { saveParticipantId } from './participantStorage'

export async function createParticipant(firstName: string, lastName: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('participants')
        .insert({
            first_name: firstName,
            last_name: lastName,
        })
        .select('id')
        .single()

    if (error) throw error

    saveParticipantId(data.id)

    return data.id
}