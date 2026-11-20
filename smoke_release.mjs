// Bounded release gate for changed shared menus, sound, saves and match replay.
// Does not claim full career/manual device coverage. Each UI test owns its server.
import {spawnSync}from 'node:child_process';
const tests=['pointer_aim_test.mjs','audio_settings_test.mjs','audio_rng_test.mjs','training_gain_v2_test.mjs','draft_rules_v2_test.mjs','pro_match_rules_test.mjs','pro_match_version_transition_test.mjs','school_record_read_test.mjs','storage_queue_test.mjs','audio_settings_ui_test.mjs','growth_rules_ui_test.mjs','draft_rules_ui_test.mjs'];
const done=[];for(const file of tests){console.log('\nRELEASE CHECK '+file);const result=spawnSync(process.execPath,[file],{stdio:'inherit',timeout:110000});if(result.error||result.status!==0){console.error('RELEASE CHECK FAILED '+file,result.error?.message||result.status);process.exit(1);}done.push(file);}console.log('\nRELEASE SMOKE PASS '+done.length+' focused tests; NOT real-phone/audio-hearing/full-career approval');
