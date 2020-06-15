package com.enonic.lib.mylib;

import java.util.concurrent.ThreadLocalRandom;

public final class RandomGeneratorHandler
{
    private static final String CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public boolean randomBoolean()
    {
        return ThreadLocalRandom.current().nextBoolean();
    }

    public Long randomInteger( long min, long max )
    {
        return ThreadLocalRandom.current().nextLong( min, max + 1 );
    }

    public Double randomNumber( double min, double max )
    {
        return ThreadLocalRandom.current().nextDouble( min, max );
    }

    public String randomString( int length )
    {
        ThreadLocalRandom rnd = ThreadLocalRandom.current();
        StringBuilder sb = new StringBuilder( length );

        for ( int i = 0; i < length; i++ )
        {
            sb.append( CHARS.charAt( rnd.nextInt( CHARS.length() ) ) );
        }
        return sb.toString();
    }

}
