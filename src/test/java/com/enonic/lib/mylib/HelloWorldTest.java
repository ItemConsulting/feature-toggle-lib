package com.enonic.lib.mylib;

import com.enonic.xp.testing.ScriptRunnerSupport;

public class HelloWorldTest
    extends ScriptRunnerSupport
{
    @Override
    public String getScriptTestFile()
    {
        return "site/lib/hello-world-test.js";
    }

}
