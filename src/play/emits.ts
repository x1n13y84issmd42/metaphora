import * as debug from 'debug';
import * as m from '../metaphora';

const log = debug('test');

class Flow {
	@m.emits
	op1(a: number) {
		return (a*2);
	}
}

let f = new Flow();

m.bind(f.op1, (doubled) => {
	log(`The doubled value is`, doubled);
});

f.op1(13);
