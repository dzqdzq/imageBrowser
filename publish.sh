#!/bin/bash

# 图片浏览器发布脚本启动器

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "🔧 创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "🚀 激活虚拟环境..."
source venv/bin/activate

# 检查oss2是否已安装
if ! python3 -c "import oss2" 2>/dev/null; then
    echo "📦 安装oss2依赖..."
    pip install oss2
fi

pnpm run build 

# 运行发布脚本，传递所有参数
echo "🎯 运行发布脚本..."
python3 upload.py dist