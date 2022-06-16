/****************************************************************************
 Copyright (c) 2021 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

// clang-format off
#include "core/builtin/Effects.h"
#include "base/StringUtil.h"
namespace cc {

// absolute essential effects
const GzipedString BUILTIN_EFFECTS { 
"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"
};
} // namespace cc