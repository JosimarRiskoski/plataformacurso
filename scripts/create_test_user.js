
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttrkhbqopakutiougprb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cmtoYnFvcGFrdXRpb3VncHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDUxOTEsImV4cCI6MjA4NTYyMTE5MX0.oabihcv8Goe7Yu53ewT-S7zPoeXv1Hc_plXtxTrJ_Yk'
const supabase = createClient(supabaseUrl, supabaseKey)

async function create() {
    const email = 'boazhsd@gmail.com'
    const password = '135921'
    const name = 'Boaz HSD'
    const companyName = 'HSD Academy'

    // Tentando usar um slug que provavelmente está livre ou o mesmo se falhar
    const slug = 'hsd'

    console.log(`Tentando criar usuário: ${email} ...`)

    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
    })

    if (authError) {
        console.error('❌ Erro no Auth:', authError.message)
        // Se o erro for "User already registered", tentamos fazer login para pegar o ID
        if (authError.message.includes('already registered')) {
            console.log('Usuário já existe. Tentando login...')
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
            if (loginError) {
                console.error('❌ Falha ao logar com usuário existente:', loginError.message)
                return
            }
            authData.user = loginData.user
        } else {
            return
        }
    }

    const user = authData.user
    if (!user) {
        console.error('⚠️ Usuário criado mas sem sessão. Verifique se a confirmação de email está ativada no Supabase.')
        return
    }

    console.log('✅ Usuário Autenticado:', user.id)

    // 2. Create Organization
    console.log('Criando/Buscando Organização...')

    // Primeiro tenta buscar para não dar erro de duplicidade
    let { data: org } = await supabase.from('organizations').select().eq('slug', slug).single()

    if (!org) {
        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: companyName,
                slug: slug,
                theme_colors: { primary: '#E50914', background: '#141414' }
            })
            .select()
            .single()

        if (orgError) {
            console.error('❌ Erro ao criar organização:', orgError.message)
            return
        }
        org = newOrg
    }

    console.log('✅ Organização Pronta:', org.id, org.slug)

    // 3. Link Profile
    console.log('Vinculando Perfil Admin...')
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            full_name: name,
            email: email,
            role: 'admin',
            organization_id: org.id
        })

    if (profileError) {
        console.error('❌ Erro no Profile:', profileError.message)
    } else {
        console.log('✅ SUCESSO! Usuário criado e vinculado.')
        console.log('------------------------------------------------')
        console.log(`Login URL: http://localhost:5185/${org.slug}/login`)
        console.log(`Email: ${email}`)
        console.log(`Senha: ${password}`)
        console.log('------------------------------------------------')
    }
}

create()
