package com.enonic.lib.mylib;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class RandomGeneratorTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "site/lib/random-gen-test.js";
    }

}
