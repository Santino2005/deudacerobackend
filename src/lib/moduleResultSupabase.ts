// src/lib/moduleResultSupabase.ts

import { createClient } from '@/lib/supabase/client'
import { StoredModuleResult } from './moduleAttemptStorage'

export async function saveModuleResultToSupabase(
    result: StoredModuleResult,
    participantId: string
) {
    const supabase = createClient()

    const { error } = await supabase.from('module_results').insert({
        participant_id: participantId,
        module_id: result.moduleId,
        module_name: result.moduleName,
        status: result.status,
        started_at: result.startedAt,
        finished_at: result.finishedAt,
        results: result.results,
    })

    if (error) throw error
}