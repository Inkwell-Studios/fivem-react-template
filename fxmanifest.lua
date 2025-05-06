fx_version 'cerulean'
game 'gta5'

author 'Inkwell Studios'
description 'FiveM React NUI Template'
version '1.0.0'
license 'MIT'

-- UI
ui_page 'web/build/index.html'

-- Shared Scripts
shared_scripts {
    'shared/*.lua',
    'shared/*.js'
}

-- Client Scripts
client_scripts {
    'dist/client/*.js',
    'client/*.lua'
}

-- Server Scripts
server_scripts {
    'dist/server/*.js',
    'server/*.lua'
}

-- Additional UI Assets
files {
    'web/build/index.html',
    'web/build/**/*'
} 