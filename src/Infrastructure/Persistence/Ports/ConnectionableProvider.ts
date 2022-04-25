import Connectable from './Connectable';
import GeteableModel from './GeteableModel';
import GeteableConnection from './GeteableConnection';

export default interface ConnectionableProvider extends Connectable, GeteableModel, GeteableConnection {}
