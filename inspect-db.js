require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function inspectDB() {
    const { data: courses, error: coursesError } = await supabase.from('courses').select('*');
    console.log("=== COURSES TABLE ===");
    if (coursesError) console.error(coursesError);
    else console.log(JSON.stringify(courses, null, 2));

    // Check if there are other relevant tables like modules or lessons
    const { data: modules, error: modulesError } = await supabase.from('modules').select('*');
    if (!modulesError && modules && modules.length > 0) {
        console.log("=== MODULES TABLE ===");
        console.log(JSON.stringify(modules, null, 2));
    }

    const { data: lessons, error: lessonsError } = await supabase.from('lessons').select('*');
    if (!lessonsError && lessons && lessons.length > 0) {
        console.log("=== LESSONS TABLE ===");
        console.log(JSON.stringify(lessons, null, 2));
    }
}
inspectDB();
