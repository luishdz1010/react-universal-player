/**
 * @jest-environment node
 */
import url from 'url'
import { commonPlayersTests } from './players.jest'

commonPlayersTests(url.URL)
